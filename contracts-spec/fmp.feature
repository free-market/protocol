Feature: fmp
  Scenario: I can deposit
    Given I have an account with 1000 ETH
    When I call tricrypto.exchange(2, 0, '100000000000000000', '10000000000000000', true)
    And I call fmp.deposit(USDC_ADDRESS, '10000000000000000')
    Then my deposit logs should match the snapshot
