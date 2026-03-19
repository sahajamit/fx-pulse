Feature: FX Pulse - Real-Time Foreign Exchange Trading Platform
  FX Pulse is an electronic trading platform that allows users to trade
  foreign exchange (currency pairs) in real time. Users can trade instantly
  by clicking live rate tiles, or request competitive quotes from multiple
  dealers before choosing the best price. All trades are recorded in a
  central blotter for tracking and review.

  # ---------------------------------------------------------------------------
  # LOGIN
  # ---------------------------------------------------------------------------

  @login
  Scenario: Successful login with valid credentials
    Given the user is on the FX Pulse login page
    When the user enters username "admin" and password "admin"
    And the user clicks the "Login" button
    Then the user is taken to the FX Pulse trading dashboard
    And the header, rate tiles, RFQ panel, and trade blotter are all visible

  @login @negative
  Scenario: Failed login with invalid credentials
    Given the user is on the FX Pulse login page
    When the user enters username "admin" and password "wrongpassword"
    And the user clicks the "Login" button
    Then an error message is displayed indicating invalid credentials
    And the user remains on the login page

  @login @negative
  Scenario: Failed login with empty credentials
    Given the user is on the FX Pulse login page
    When the user leaves the username and password fields blank
    And the user clicks the "Login" button
    Then an error message is displayed indicating invalid credentials
    And the user remains on the login page

  # ---------------------------------------------------------------------------
  # HEADER
  # ---------------------------------------------------------------------------

  @header
  Scenario: Header displays branding and connection status
    Given the user is logged in and viewing the trading dashboard
    Then the header shows the "FX PULSE" branding with the subtitle "Electronic Trading"
    And the header shows a teal "CONNECTED" status indicator
    And the header shows a live clock displaying the current UTC time
    And the clock updates every second

  @header @connection
  Scenario: Header reflects a temporary connection drop
    Given the user is logged in and the connection status shows "CONNECTED" in teal
    When the platform briefly loses connectivity
    Then the connection status changes to "RECONNECTING..." in rose
    And when connectivity is restored the status returns to "CONNECTED" in teal

  # ---------------------------------------------------------------------------
  # LIVE RATE TILES (ESP - Electronic Streaming Prices)
  # ---------------------------------------------------------------------------

  @esp @rate-tiles
  Scenario: All eight currency pair tiles are displayed on load
    Given the user is logged in and viewing the trading dashboard
    Then 8 rate tiles are displayed in a horizontal row
    And the following currency pairs are shown:
      | Pair    |
      | EUR/USD |
      | GBP/USD |
      | USD/JPY |
      | AUD/USD |
      | USD/CHF |
      | USD/CAD |
      | EUR/GBP |
      | EUR/JPY |

  @esp @rate-tiles
  Scenario: Each rate tile shows a live BID and ASK price
    Given the user is viewing the rate tiles
    When live prices are streaming
    Then each tile displays the pair name
    And each tile shows a "Sell" button with the current BID price
    And each tile shows a "Buy" button with the current ASK price
    And each tile shows the current spread in pips

  @esp @rate-tiles
  Scenario: Rate tile flashes teal on an uptick
    Given the user is viewing the rate tile for "EUR/USD"
    When the mid price moves higher than the previous mid price
    Then the tile border briefly flashes teal to indicate an uptick
    And the flash disappears after approximately 300 milliseconds

  @esp @rate-tiles
  Scenario: Rate tile flashes rose on a downtick
    Given the user is viewing the rate tile for "EUR/USD"
    When the mid price moves lower than the previous mid price
    Then the tile border briefly flashes rose to indicate a downtick
    And the flash disappears after approximately 300 milliseconds

  @esp @rate-tiles
  Scenario: Prices stream at varied intervals per pair
    Given the user is viewing the rate tiles
    Then each currency pair updates its price independently
    And update intervals range between 500 milliseconds and 2 seconds per pair

  # ---------------------------------------------------------------------------
  # CLICK-TO-TRADE (ESP Execution)
  # ---------------------------------------------------------------------------

  @esp @click-to-trade
  Scenario Outline: User executes a BUY trade from a rate tile
    Given the user is viewing the rate tile for "<pair>"
    And the current ASK price for "<pair>" is displayed
    When the user clicks the "Buy" button on the "<pair>" tile
    Then a new trade is created with the following details:
      | Field        | Value     |
      | Pair         | <pair>    |
      | Side         | BUY       |
      | Rate         | ASK price |
      | Notional     | 1,000,000 |
      | Status       | FILLED    |
      | Counterparty | Market    |
      | Source       | ESP       |
    And the trade appears at the top of the trade blotter
    And the trade has a unique Trade ID in the format "FXnnnnnn"

    Examples:
      | pair    |
      | EUR/USD |
      | GBP/USD |
      | USD/JPY |
      | AUD/USD |
      | USD/CHF |
      | USD/CAD |
      | EUR/GBP |
      | EUR/JPY |

  @esp @click-to-trade
  Scenario Outline: User executes a SELL trade from a rate tile
    Given the user is viewing the rate tile for "<pair>"
    And the current BID price for "<pair>" is displayed
    When the user clicks the "Sell" button on the "<pair>" tile
    Then a new trade is created with the following details:
      | Field        | Value     |
      | Pair         | <pair>    |
      | Side         | SELL      |
      | Rate         | BID price |
      | Notional     | 1,000,000 |
      | Status       | FILLED    |
      | Counterparty | Market    |
      | Source       | ESP       |
    And the trade appears at the top of the trade blotter

    Examples:
      | pair    |
      | EUR/USD |
      | GBP/USD |
      | USD/JPY |
      | AUD/USD |
      | USD/CHF |
      | USD/CAD |
      | EUR/GBP |
      | EUR/JPY |

  @esp @click-to-trade
  Scenario: Multiple rapid trades are each recorded separately
    Given the user is viewing the rate tiles
    When the user clicks "Buy" on "EUR/USD" and then clicks "Sell" on "GBP/USD"
    Then both trades appear in the blotter as separate entries
    And each trade has a unique Trade ID

  # ---------------------------------------------------------------------------
  # RFQ (Request for Quote) - Form Submission
  # ---------------------------------------------------------------------------

  @rfq @form
  Scenario: RFQ panel is in IDLE state on initial load
    Given the user is logged in and viewing the trading dashboard
    Then the RFQ panel displays the "Request for Quote" heading
    And the RFQ form fields are enabled
    And the status badge shows "IDLE"

  @rfq @form
  Scenario: User fills in the RFQ form
    Given the RFQ panel is in IDLE state
    When the user selects currency pair "GBP/USD" from the dropdown
    And the user enters notional amount "5,000,000"
    And the user selects tenor "1M"
    Then the currency pair field shows "GBP/USD"
    And the notional field shows "5,000,000" formatted with commas
    And the "1M" tenor pill is highlighted

  @rfq @form
  Scenario Outline: User can select any available tenor
    Given the RFQ panel is in IDLE state
    When the user clicks the "<tenor>" tenor pill
    Then the "<tenor>" pill is highlighted in the accent colour
    And all other tenor pills are in the default style

    Examples:
      | tenor |
      | SPOT  |
      | 1W    |
      | 1M    |
      | 2M    |
      | 3M    |

  @rfq @form @negative
  Scenario: User cannot submit an RFQ with zero or empty notional
    Given the RFQ panel is in IDLE state
    When the user clears the notional field
    And the user clicks "Request Quote"
    Then no RFQ is submitted
    And the form remains in IDLE state

  @rfq @form
  Scenario: Default form values
    Given the RFQ panel is in IDLE state
    Then the currency pair defaults to "EUR/USD"
    And the notional defaults to "1,000,000"
    And the tenor defaults to "SPOT"

  # ---------------------------------------------------------------------------
  # RFQ - Pending and Quote Arrival
  # ---------------------------------------------------------------------------

  @rfq @pending
  Scenario: Submitting an RFQ transitions to PENDING state
    Given the RFQ panel is in IDLE state
    And the user has selected pair "EUR/USD", notional "1,000,000", and tenor "SPOT"
    When the user clicks "Request Quote"
    Then the RFQ status changes to "PENDING"
    And the status badge pulses with a violet animation
    And all form fields (pair, notional, tenor) become disabled
    And the "Request Quote" button becomes disabled
    And a 30-second countdown timer appears in the panel header

  @rfq @quotes
  Scenario: Dealer quotes arrive in staggered fashion
    Given an RFQ has been submitted and the status is "PENDING"
    Then quotes arrive from 4 dealers over a period of approximately 500ms to 3 seconds:
      | Dealer        |
      | Deutsche Bank |
      | Barclays      |
      | Citi          |
      | JPMorgan      |
    And the status changes to "QUOTED" when the first quote arrives
    And the quote counter displays the number of received quotes out of 4
    And each dealer quote card shows a BID price and an ASK price

  @rfq @quotes
  Scenario: Best quote is highlighted with a badge
    Given all 4 dealer quotes have arrived
    Then the dealer offering the best ASK (lowest) receives a "BEST" badge
    And the dealer offering the best BID (highest) receives a "BEST" badge
    And the "BEST" badge is recalculated each time a new quote arrives

  @rfq @quotes
  Scenario: Each dealer quotes a slightly different price
    Given an RFQ has been submitted for "EUR/USD"
    When all 4 dealer quotes have arrived
    Then each dealer shows a different BID and ASK price
    And the spread varies because each dealer applies a different spread multiplier

  # ---------------------------------------------------------------------------
  # RFQ - Accepting a Quote
  # ---------------------------------------------------------------------------

  @rfq @accept
  Scenario: User accepts a dealer quote by clicking Buy
    Given the RFQ status is "QUOTED" and all dealer quotes are visible
    When the user clicks the "Buy" button on the "Deutsche Bank" quote card
    Then the RFQ status changes to "ACCEPTED"
    And a new trade is booked to the blotter with the following details:
      | Field        | Value         |
      | Pair         | EUR/USD       |
      | Side         | BUY           |
      | Rate         | ASK price     |
      | Status       | FILLED        |
      | Counterparty | Deutsche Bank |
      | Source       | RFQ           |
    And the notional on the trade matches the RFQ notional
    And a confirmation message shows "Accepted quote from Deutsche Bank"
    And the "New RFQ" link is displayed

  @rfq @accept
  Scenario: User accepts a dealer quote by clicking Sell
    Given the RFQ status is "QUOTED" and dealer quotes are visible
    When the user clicks the "Sell" button on the "Barclays" quote card
    Then the RFQ status changes to "ACCEPTED"
    And a new trade is booked to the blotter with the following details:
      | Field        | Value    |
      | Side         | SELL     |
      | Rate         | BID price|
      | Counterparty | Barclays |
      | Source       | RFQ      |
    And the trade status is "FILLED"

  @rfq @accept
  Scenario: Only one quote can be accepted per RFQ
    Given the user has accepted a quote from "Citi"
    Then all other dealer quote cards are disabled
    And the "Reject All" button is no longer visible
    And the user cannot click Buy or Sell on any other dealer card

  # ---------------------------------------------------------------------------
  # RFQ - Rejecting Quotes
  # ---------------------------------------------------------------------------

  @rfq @reject
  Scenario: User rejects all dealer quotes
    Given the RFQ status is "QUOTED" and dealer quotes are visible
    When the user clicks the "Reject All" button
    Then the RFQ status changes to "REJECTED"
    And no trade is booked to the blotter
    And a message shows "All quotes rejected"
    And the "New RFQ" link is displayed
    And the countdown timer stops

  @rfq @reject
  Scenario: Reject All button only appears when quotes exist
    Given the RFQ status is "PENDING" and no quotes have arrived yet
    Then the "Reject All" button is not visible
    When the first dealer quote arrives
    Then the "Reject All" button becomes visible

  # ---------------------------------------------------------------------------
  # RFQ - Expiry
  # ---------------------------------------------------------------------------

  @rfq @expiry
  Scenario: RFQ expires after 30 seconds with no user action
    Given the RFQ status is "QUOTED" and dealer quotes are visible
    And the user does not accept or reject any quote
    When the 30-second countdown reaches zero
    Then the RFQ status changes to "EXPIRED"
    And a message shows "RFQ expired -- quotes are no longer valid"
    And all dealer quote Buy and Sell buttons become disabled
    And the "Reject All" button is no longer visible
    And the "New RFQ" link is displayed

  @rfq @expiry
  Scenario: RFQ expires while still in PENDING state
    Given the RFQ status is "PENDING"
    And no dealer quotes arrive before the 30-second timeout
    When the countdown reaches zero
    Then the RFQ status changes to "EXPIRED"
    And the "New RFQ" link is displayed

  @rfq @expiry
  Scenario: Countdown timer counts down in real time
    Given the RFQ has been submitted and the countdown shows "30s"
    Then the timer decrements by one second approximately every second
    And the timer displays in the format "<N>s" (for example "25s", "10s", "1s")

  # ---------------------------------------------------------------------------
  # RFQ - Reset
  # ---------------------------------------------------------------------------

  @rfq @reset
  Scenario: User starts a new RFQ after acceptance
    Given the RFQ status is "ACCEPTED"
    When the user clicks the "New RFQ" link
    Then the RFQ status returns to "IDLE"
    And all form fields are re-enabled
    And previous dealer quote cards are cleared
    And the form shows the default values (EUR/USD, 1,000,000, SPOT)

  @rfq @reset
  Scenario: User starts a new RFQ after rejection
    Given the RFQ status is "REJECTED"
    When the user clicks the "New RFQ" link
    Then the RFQ status returns to "IDLE"
    And all form fields are re-enabled
    And previous dealer quote cards are cleared

  @rfq @reset
  Scenario: User starts a new RFQ after expiry
    Given the RFQ status is "EXPIRED"
    When the user clicks the "New RFQ" link
    Then the RFQ status returns to "IDLE"
    And all form fields are re-enabled
    And previous dealer quote cards are cleared

  # ---------------------------------------------------------------------------
  # TRADE BLOTTER
  # ---------------------------------------------------------------------------

  @blotter
  Scenario: Trade blotter is pre-seeded with historical trades on load
    Given the user is logged in and viewing the trading dashboard
    Then the trade blotter displays 12 historical (pre-seeded) trades
    And each trade has a unique Trade ID in the format "FXnnnnnn"
    And historical trades are sorted by time in descending order (newest first)

  @blotter
  Scenario: Trade blotter displays all required columns
    Given the user is viewing the trade blotter
    Then the blotter table has the following columns:
      | Column       |
      | Trade ID     |
      | Time         |
      | Pair         |
      | Side         |
      | Notional     |
      | Rate         |
      | Status       |
      | Counterparty |
      | Source       |

  @blotter
  Scenario: BUY side is displayed in teal and SELL side in rose
    Given the trade blotter contains trades with both BUY and SELL sides
    Then BUY trades display "BUY" in teal colour in the Side column
    And SELL trades display "SELL" in rose colour in the Side column

  @blotter
  Scenario: Trade blotter shows total trade count
    Given the trade blotter contains trades
    Then the blotter header shows the total number of trades (for example "12 trades")
    And the count updates when new trades are added

  @blotter @sorting
  Scenario: User sorts trades by a column
    Given the trade blotter contains multiple trades
    When the user clicks the "Time" column header
    Then the trades are sorted by time
    And clicking the column header again reverses the sort order

  @blotter @sorting
  Scenario: Default sort is by time descending
    Given the user has just loaded the trading dashboard
    Then the trade blotter is sorted by the Time column in descending order
    And the most recent trade appears at the top

  @blotter @filtering
  Scenario: User filters trades by Trade ID
    Given the trade blotter contains multiple trades
    When the user opens the filter on the "Trade ID" column
    And the user enters a specific Trade ID value
    Then only trades matching that Trade ID are displayed

  @blotter @filtering
  Scenario: User filters trades by currency pair
    Given the trade blotter contains trades for multiple currency pairs
    When the user opens the filter on the "Pair" column
    And the user selects "EUR/USD"
    Then only EUR/USD trades are shown in the blotter

  @blotter @filtering
  Scenario: User filters trades by counterparty
    Given the trade blotter contains trades from multiple counterparties
    When the user opens the filter on the "Counterparty" column
    And the user selects "Deutsche Bank"
    Then only trades with counterparty "Deutsche Bank" are shown

  @blotter
  Scenario: Notional is formatted in abbreviated form
    Given the trade blotter contains a trade with notional 1000000
    Then the Notional column displays "1.0M"
    And a trade with notional 500000 displays "500K"
    And a trade with notional 5000000 displays "5.0M"

  @blotter
  Scenario: Rate is formatted with correct decimal precision
    Given the trade blotter contains trades
    Then rates for non-JPY pairs (e.g. EUR/USD) display 5 decimal places
    And rates for JPY pairs (e.g. USD/JPY) display 3 decimal places

  @blotter
  Scenario: Time column displays in HH:MM:SS format
    Given the trade blotter contains trades
    Then the Time column shows each trade time in "HH:MM:SS" format using 24-hour notation

  @blotter
  Scenario: New ESP trade appears in blotter immediately
    Given the user is viewing the trade blotter with 12 pre-seeded trades
    When the user executes a BUY trade on "EUR/USD" from the rate tile
    Then the blotter now shows 13 trades
    And the new trade is at the top of the list
    And the trade count in the header updates to "13 trades"

  @blotter
  Scenario: New RFQ trade appears in blotter after accepting a quote
    Given the user has submitted an RFQ and received dealer quotes
    When the user accepts a quote from "JPMorgan" by clicking "Buy"
    Then a new trade appears in the blotter with source "RFQ"
    And the counterparty shows "JPMorgan"
    And the status shows "FILLED"

  # ---------------------------------------------------------------------------
  # END-TO-END WORKFLOWS
  # ---------------------------------------------------------------------------

  @e2e @esp
  Scenario: Complete ESP trading workflow
    Given the user is logged in and viewing the trading dashboard
    And live prices are streaming on all 8 rate tiles
    When the user clicks "Buy" on the "EUR/USD" rate tile
    Then a trade with side "BUY", source "ESP", and status "FILLED" appears in the blotter
    And the counterparty is "Market"
    And the rate matches the ASK price at the time of the click

  @e2e @rfq
  Scenario: Complete RFQ workflow ending in acceptance
    Given the user is logged in and viewing the trading dashboard
    When the user selects pair "GBP/USD", enters notional "5,000,000", and selects tenor "1W"
    And the user clicks "Request Quote"
    Then the RFQ enters "PENDING" state and the form is disabled
    And within 3 seconds, quotes arrive from Deutsche Bank, Barclays, Citi, and JPMorgan
    And the best quote is marked with a "BEST" badge
    When the user clicks "Buy" on the best-priced dealer card
    Then the RFQ status becomes "ACCEPTED"
    And a FILLED trade for GBP/USD with notional 5,000,000 and source "RFQ" appears in the blotter
    When the user clicks "New RFQ"
    Then the form resets to IDLE and the user can submit another RFQ

  @e2e @rfq
  Scenario: Complete RFQ workflow ending in rejection
    Given the user is logged in and viewing the trading dashboard
    When the user submits an RFQ for "USD/JPY" with notional "10,000,000" and tenor "3M"
    And dealer quotes arrive
    And the user clicks "Reject All"
    Then the RFQ status becomes "REJECTED"
    And no new trade is added to the blotter
    When the user clicks "New RFQ"
    Then the form resets to IDLE state

  @e2e @rfq
  Scenario: Complete RFQ workflow ending in expiry
    Given the user is logged in and viewing the trading dashboard
    When the user submits an RFQ for "AUD/USD" with notional "2,000,000" and tenor "SPOT"
    And dealer quotes arrive
    And the user takes no action for 30 seconds
    Then the RFQ status becomes "EXPIRED"
    And no new trade is added to the blotter
    And the dealer quote buttons are all disabled
    When the user clicks "New RFQ"
    Then the form resets to IDLE state
