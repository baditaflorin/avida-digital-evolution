import{X as n,A as s,t as r,f as d}from"./duckdb-BYZ3T0hN.js";const u="/avida-digital-evolution/assets/duckdb-browser-eh.worker-hQa-dcAV.js",o="/avida-digital-evolution/assets/duckdb-browser-mvp.worker-C9hF7LGh.js",l="/avida-digital-evolution/assets/duckdb-eh-9ubY-jlA.wasm",c="/avida-digital-evolution/assets/duckdb-mvp-BP0pRkMH.wasm",m={mvp:{mainModule:c,mainWorker:o},eh:{mainModule:l,mainWorker:u}};class k{db;conn;fallbackRows=[];failedReason;async init(){try{const a=await n(m),e=new Worker(a.mainWorker??o),i=new s(r.WARNING);this.db=new d(i,e),await this.db.instantiate(a.mainModule,a.pthreadWorker),this.conn=await this.db.connect(),await this.conn.query(`
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
      `)}catch(a){this.failedReason=a instanceof Error?a.message:"DuckDB initialization failed"}}get status(){return this.conn?"DuckDB-WASM active":`Session log fallback${this.failedReason?` (${this.failedReason})`:""}`}async append(a){const e=b(a);this.fallbackRows.push(e),this.fallbackRows=this.fallbackRows.slice(-160),this.conn&&await this.conn.query(`
      insert into evolution_log_v1 values (
        ${e.update},
        ${e.population},
        ${e.births},
        ${e.deaths},
        ${e.mutations},
        ${e.mean_merit},
        ${e.diversity},
        ${e.task_total}
      )
    `)}async recent(a=8){return this.conn?(await this.conn.query(`
      select *
      from evolution_log_v1
      order by update desc
      limit ${Math.max(1,Math.min(24,a))}
    `)).toArray().map(i=>({update:Number(i.update),population:Number(i.population),births:Number(i.births),deaths:Number(i.deaths),mutations:Number(i.mutations),mean_merit:Number(i.mean_merit),diversity:Number(i.diversity),task_total:Number(i.task_total)})):this.fallbackRows.slice(-a).reverse()}}const b=t=>({update:t.update,population:t.population,births:t.births,deaths:t.deaths,mutations:t.mutations,mean_merit:Number(t.meanMerit.toFixed(2)),diversity:Number(t.diversity.toFixed(2)),task_total:t.taskLogic+t.taskSensor+t.taskReplicator+t.taskEntropy});export{k as EvolutionLogStore};
