#!/bin/bash

script=./scripts/deploy.js
set -eo pipefail
date=`date '+%F_%T'`

network=$1
if [[ $network = "" ]]; then
    network=hardhat
fi
if [[ $network = "hardhat" ]]; then
    script=./scripts/deploy.ts
    #script=./scripts/deploy-hardhat.ts
fi
echo npx hardhat run $script --network $network  2>&1 | tee "./logs/${network}-deploy_${date}.log"
npx hardhat run $script --network $network  2>&1 | tee "./logs/${network}-deploy_${date}.log"

# echo "[arg1] Network: ${network}"
# npx hardhat deploy --network $1 2>&1 | tee "./logs/${network}-deploy_${date}.log"
