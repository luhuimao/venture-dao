#!/bin/bash

npm test ./test/collective/collective-clear-fund.test.js $*
npm test ./test/collective/collective-daoset.test.js $*
npm test ./test/collective/collective-expense-proposal.test.js $*
npm test ./test/collective/collective-free-in.test.js $*
npm test ./test/collective/collective-funding-proposal.test.js $*
npm test ./test/collective/collective-fundraise-proposal.test.js $*
npm test ./test/collective/collective-governor-management-proposal.test.js $*
npm test ./test/collective/collective-grace-withdraw.test.js $*
npm test ./test/collective/collective-member-eligibility-deposit.test.js $*
npm test ./test/collective/collective-receipt-erc721.test.js $*
npm test ./test/collective/collective-redemption-fee.test.js $*
npm test ./test/collective/collective-refund.test.js $*
npm test ./test/collective/collective-set-rice-receiver.test.js $*
npm test ./test/collective/collective-top-up-proposal.test.js $*
npm test ./test/collective/collective-vesting.test.js $*
npm test ./test/collective/summon-collective-dao.test.js $*

