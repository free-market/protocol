// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// percents have 4 decimals of precision, so:
// 100% is represented as 1000000 (100.0000%)
// 1% is represented as 1000
// 1 basis point (1/100th of a percent) is 10
// the smallest possible percentage is 1/10th of a basis point
library LibPercent {
  uint256 constant ONE_PERCENT = 1000;
  uint256 constant ONE_HUNDRED_PERCENT = ONE_PERCENT * 100;
  uint256 constant DENOMINATOR = ONE_HUNDRED_PERCENT * 100;

  function percentageOf(uint256 value, uint256 percent) internal pure returns (uint256) {
    require(0 <= percent && percent <= 1000000, 'percent must be between 0 and 1000000');
    uint256 numerator = ONE_HUNDRED_PERCENT - percent;
    uint256 x = value * numerator;
    return x / DENOMINATOR;
  }
}
