Feature: fmp
  Scenario: I can deposit
    Given I have an account with 1000 ETH
    When I exchange some ETH for WETH
    And I exchange some WETH for USDT
    And I exchange some USDT for USDC
    And I deposit some USDC into the protocol
    Then my deposit logs should match the snapshot
