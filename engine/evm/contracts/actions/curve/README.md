The exchange signature is this now:

```
interface CurveTriCrypto2 {
    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 min_dy,
        bool use_eth
    ) external payable;
}
```

And this is a guess, couldn't get abi-to-sol working

```
function get_dy(uint256 i, uint256 j, uint256 dx) external view returns(uint256)
```
