# Meetings Manager tasks. Run `make` to list them.
# Backend (Django) targets go here once backend/ exists.

MOBILE := mobile

.DEFAULT_GOAL := help
.PHONY: help install start tunnel android lint typecheck doctor check clean

help: ## List available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# Mobile (Expo)

install: ## Install mobile dependencies
	cd $(MOBILE) && npm install

start: ## Start the dev server; scan the QR code with Expo Go
	cd $(MOBILE) && npm start

tunnel: ## Start the dev server over an internet tunnel; use when the phone can't reach this PC on Wi-Fi
	cd $(MOBILE) && npm run tunnel

android: ## Start and open on an Android emulator or USB device (needs the Android SDK)
	cd $(MOBILE) && npm run android

lint: ## Lint the mobile app
	cd $(MOBILE) && npm run lint

typecheck: ## Type-check the mobile app
	cd $(MOBILE) && npm run typecheck

doctor: ## Check Expo config and dependency versions
	cd $(MOBILE) && npx expo-doctor

check: lint typecheck doctor ## Run lint, typecheck and doctor

clean: ## Delete node_modules and the Expo cache (run `make install` afterwards)
	rm -rf $(MOBILE)/node_modules $(MOBILE)/.expo
