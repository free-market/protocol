// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract EternalStorage {
  // owner will be front door
  address owner = msg.sender;
  // address latestVersion;

  mapping(bytes32 => uint256) uIntStorage;
  mapping(bytes32 => string) stringStorage;
  mapping(bytes32 => address) addressStorage;
  mapping(bytes32 => bytes) bytesStorage;
  mapping(bytes32 => bool) boolStorage;
  mapping(bytes32 => int256) intStorage;

  // modifier onlyLatestVersion() {
  //   require(msg.sender == latestVersion);
  //   _;
  // }
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // function upgradeVersion(address _newVersion) public {
  //   require(msg.sender == owner);
  //   latestVersion = _newVersion;
  // }

  // *** Getter Methods ***
  function getUint(bytes32 _key) external view returns (uint256) {
    return uIntStorage[_key];
  }

  function getString(bytes32 _key) external view returns (string memory) {
    return stringStorage[_key];
  }

  function getAddress(bytes32 _key) external view returns (address) {
    return addressStorage[_key];
  }

  function getBytes(bytes32 _key) external view returns (bytes memory) {
    return bytesStorage[_key];
  }

  function getBool(bytes32 _key) external view returns (bool) {
    return boolStorage[_key];
  }

  function getInt(bytes32 _key) external view returns (int256) {
    return intStorage[_key];
  }

  // *** Setter Methods ***
  function setUint(bytes32 _key, uint256 _value) external onlyOwner {
    uIntStorage[_key] = _value;
  }

  function setString(bytes32 _key, string memory _value) external onlyOwner {
    stringStorage[_key] = _value;
  }

  function setAddress(bytes32 _key, address _value) external onlyOwner {
    addressStorage[_key] = _value;
  }

  function setBytes(bytes32 _key, bytes memory _value) external onlyOwner {
    bytesStorage[_key] = _value;
  }

  function setBool(bytes32 _key, bool _value) external onlyOwner {
    boolStorage[_key] = _value;
  }

  function setInt(bytes32 _key, int256 _value) external onlyOwner {
    intStorage[_key] = _value;
  }

  // *** Delete Methods ***
  function deleteUint(bytes32 _key) external onlyOwner {
    delete uIntStorage[_key];
  }

  function deleteString(bytes32 _key) external onlyOwner {
    delete stringStorage[_key];
  }

  function deleteAddress(bytes32 _key) external onlyOwner {
    delete addressStorage[_key];
  }

  function deleteBytes(bytes32 _key) external onlyOwner {
    delete bytesStorage[_key];
  }

  function deleteBool(bytes32 _key) external onlyOwner {
    delete boolStorage[_key];
  }

  function deleteInt(bytes32 _key) external onlyOwner {
    delete intStorage[_key];
  }
}
