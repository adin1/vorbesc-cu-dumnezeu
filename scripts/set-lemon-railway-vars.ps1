param(
  [string]$Service = 'backend-api',
  [string]$Environment = 'production'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comanda lipseste: $Name"
  }
}

function Set-RailwayVar {
  param(
    [string]$Key,
    [string]$Value,
    [bool]$SkipDeploy = $true
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "Valoare lipsa pentru $Key"
  }

  if ($SkipDeploy) {
    railway variable set "$Key=$Value" -s $Service -e $Environment --skip-deploys | Out-Null
  } else {
    railway variable set "$Key=$Value" -s $Service -e $Environment | Out-Null
  }

  Write-Host "Setat: $Key" -ForegroundColor Green
}

Require-Command -Name 'railway'

Write-Host "Configurare Lemon Squeezy pentru Railway ($Service / $Environment)" -ForegroundColor Cyan
Write-Host "Introdu valorile cerute din dashboard-ul Lemon Squeezy." -ForegroundColor Yellow

$webhookSecret = Read-Host 'LEMONSQUEEZY_WEBHOOK_SECRET'
$basicCheckout = Read-Host 'LEMONSQUEEZY_CHECKOUT_URL_PREMIUM_BASIC'
$familyCheckout = Read-Host 'LEMONSQUEEZY_CHECKOUT_URL_PREMIUM_FAMILY'
$don500 = Read-Host 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_500'
$don1000 = Read-Host 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_1000'
$don2500 = Read-Host 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_2500'
$don5000 = Read-Host 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_5000'

Set-RailwayVar -Key 'LEMONSQUEEZY_WEBHOOK_SECRET' -Value $webhookSecret
Set-RailwayVar -Key 'LEMONSQUEEZY_CHECKOUT_URL_PREMIUM_BASIC' -Value $basicCheckout
Set-RailwayVar -Key 'LEMONSQUEEZY_CHECKOUT_URL_PREMIUM_FAMILY' -Value $familyCheckout
Set-RailwayVar -Key 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_500' -Value $don500
Set-RailwayVar -Key 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_1000' -Value $don1000
Set-RailwayVar -Key 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_2500' -Value $don2500
Set-RailwayVar -Key 'LEMONSQUEEZY_CHECKOUT_URL_DONATION_5000' -Value $don5000

# Trigger a single deploy at the end by setting provider without skip flag.
Set-RailwayVar -Key 'PAYMENT_PROVIDER' -Value 'LEMONSQUEEZY' -SkipDeploy $false

Write-Host ''
Write-Host 'Configurare terminata. Backend-ul a primit deploy automat.' -ForegroundColor Cyan
Write-Host 'Urmatorul pas: ruleaza un smoke test pe /monetization/create-checkout-session si /create-donation-checkout.' -ForegroundColor Cyan
