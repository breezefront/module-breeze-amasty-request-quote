# Amasty Request Quote Breeze Frontend Integration

## Required patches

In the [Breeze Settings](https://breezefront.com/docs/settings) section in theme configuration,
add `request_quote/cart` (or custom value set in the `Frontend Quote URL Key` configuration field) to the `Disable Breeze for specified URLs` field.

## Installation

```bash
composer require swissup/module-breeze-amasty-request-quote
bin/magento setup:upgrade --safe-mode=1
```
