# Privacy

Avida Digital Evolution does not include analytics in v1.

## Local Data

The app stores small preferences in `localStorage`, such as simulation speed. DuckDB-WASM logs are generated locally in the browser session. No simulation logs are sent to a server.

## Network Calls

The app fetches public build-adjacent metadata from:

https://api.github.com/repos/baditaflorin/avida-digital-evolution/commits/main

The Star and PayPal buttons are normal outbound links:

https://github.com/baditaflorin/avida-digital-evolution

https://www.paypal.com/paypalme/florinbadita

## Secrets

The frontend contains no secrets, API keys, passwords, or private tokens.
