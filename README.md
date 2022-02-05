# Main use case

This contract allow admin to setup any amount of pools with different lock periods of reward and deposit.

This means, that user can choose different pools with different lock-X-reward combination.

The contract allow admin to apply fee on deposit/withdraw/reward in any combination.

# Technical aspects

This contract allows users to deposit an arbitrary amount of assets for a certain period of time.

The main feature of this contract is the ability to deposit and farm the same asset on various pools with different lock periods.

The contract is designed in a way that the asset of one pool does not interface on reward calculation of other pools.

# Features

- Change of emission per block at any time.
- Contract mint tokens on demand in the token contract.
- Deposit tax up to 10%.
- Withdraw tax up to 10%.
- Tax on reward harvest.
- Deposit lock period (up to 6 months).
- Reward harvest lock period.
- Support multiple pools with the same asset.

# Admin workflow

Admin call method addPool to create a stacking pool, with arguments:
 
- _allocPoint: the weight of this pool in reward distribution.
- _lpToken: the asset that the user will deposit.
- _taxWithdraw: if any tax to be applied in the user asset on withdraw.
- _withdrawLockPeriod: time in seconds where user keep locked.
- _depositFee: any tax to be applied on user deposit.
- withUpdate: update pool info (always true).
- _harvestFee: tax to be applied when user harvest reward.

# User workflow
 
- User choose a pool in the interface.
- User approve contract to transfer tokens.
- User make a arbitrary deposit of tokens.
- According to pool setup, user need to wait to harvest reward.
- According to pool setup, user need to wait to withdraw.
