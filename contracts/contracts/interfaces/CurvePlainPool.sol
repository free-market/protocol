// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.9.0;

interface CurvePlainPool {
    function coins(uint256 i) external view returns (address);

    function get_dy(
        int128 i,
        int128 j,
        uint256 _dx
    ) external view returns (uint256);

    /// @param i Index value for the coin to send
    /// @param j Index value of the coin to receive
    /// @param _dx Amount of i being exchanged
    /// @param _min_dy Minimum amount of j to receive
    function exchange(
        int128 i,
        int128 j,
        uint256 _dx,
        uint256 _min_dy,
        bool useEth
    ) external payable returns (uint256);
}
