import * as duckdb from '@duckdb/duckdb-wasm';
import duckdbEhWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import duckdbMvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdbEhWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import duckdbMvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import type { EvolutionStats } from '../simulation/types';

export type LogRow = {
  update: number;
  population: number;
  births: number;
  deaths: number;
  mutations: number;
  mean_merit: number;
  diversity: number;
  task_total: number;
};

const bundles: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdbMvpWasm,
    mainWorker: duckdbMvpWorker,
  },
  eh: {
    mainModule: duckdbEhWasm,
    mainWorker: duckdbEhWorker,
  },
};

export class EvolutionLogStore {
  private db: duckdb.AsyncDuckDB | undefined;
  private conn: duckdb.AsyncDuckDBConnection | undefined;
  private fallbackRows: LogRow[] = [];
  private failedReason: string | undefined;

  async init(): Promise<void> {
    try {
      const bundle = await duckdb.selectBundle(bundles);
      const worker = new Worker(bundle.mainWorker ?? duckdbMvpWorker);
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      this.conn = await this.db.connect();
      await this.conn.query(`
        create table if not exists evolution_log_v1 (
          update integer,
          population integer,
          births integer,
          deaths integer,
          mutations integer,
          mean_merit double,
          diversity double,
          task_total integer
        )
      `);
    } catch (error) {
      this.failedReason = error instanceof Error ? error.message : 'DuckDB initialization failed';
    }
  }

  get status(): string {
    return this.conn
      ? 'DuckDB-WASM active'
      : `Session log fallback${this.failedReason ? ` (${this.failedReason})` : ''}`;
  }

  async append(stats: EvolutionStats): Promise<void> {
    const row = toRow(stats);
    this.fallbackRows.push(row);
    this.fallbackRows = this.fallbackRows.slice(-160);

    if (!this.conn) {
      return;
    }

    await this.conn.query(`
      insert into evolution_log_v1 values (
        ${row.update},
        ${row.population},
        ${row.births},
        ${row.deaths},
        ${row.mutations},
        ${row.mean_merit},
        ${row.diversity},
        ${row.task_total}
      )
    `);
  }

  async recent(limit = 8): Promise<LogRow[]> {
    if (!this.conn) {
      return this.fallbackRows.slice(-limit).reverse();
    }
    const table = await this.conn.query(`
      select *
      from evolution_log_v1
      order by update desc
      limit ${Math.max(1, Math.min(24, limit))}
    `);
    return table.toArray().map((row) => ({
      update: Number(row.update),
      population: Number(row.population),
      births: Number(row.births),
      deaths: Number(row.deaths),
      mutations: Number(row.mutations),
      mean_merit: Number(row.mean_merit),
      diversity: Number(row.diversity),
      task_total: Number(row.task_total),
    }));
  }
}

const toRow = (stats: EvolutionStats): LogRow => ({
  update: stats.update,
  population: stats.population,
  births: stats.births,
  deaths: stats.deaths,
  mutations: stats.mutations,
  mean_merit: Number(stats.meanMerit.toFixed(2)),
  diversity: Number(stats.diversity.toFixed(2)),
  task_total: stats.taskLogic + stats.taskSensor + stats.taskReplicator + stats.taskEntropy,
});
