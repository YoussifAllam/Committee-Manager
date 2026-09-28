# Meetings Manager tasks. Run `make` to list them.
# Backend (Django) targets go here once backend/ exists.

MOBILE := mobile

.DEFAULT_GOAL := help
.PHONY: help install start usb tunnel android apk apk-local apk-install lint typecheck doctor check clean

help: ## List available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

# Mobile (Expo)

install: ## Install mobile dependencies
	cd $(MOBILE) && npm install

start: ## Start the dev server; scan the QR code with Expo Go
	cd $(MOBILE) && npm start

usb: ## Start over USB; open Expo Go and enter exp://localhost:8081 manually (phone plugged in, USB debugging on)
	adb reverse tcp:8081 tcp:8081
	cd $(MOBILE) && npm start

tunnel: ## Start the dev server over an internet tunnel; use when the phone can't reach this PC on Wi-Fi
	cd $(MOBILE) && npm run tunnel

android: ## Start and open on an Android emulator or USB device (needs the Android SDK)
	cd $(MOBILE) && npm run android

apk: ## Build an installable Android APK on Expo's servers (EAS; needs a free Expo account)
	cd $(MOBILE) && npx eas-cli@latest build --platform android --profile preview

# Local builds use JDK 17 and the Android SDK installed under ~/Android.
ANDROID_ENV := JAVA_HOME=$(HOME)/Android/jdk-17 ANDROID_HOME=$(HOME)/Android/Sdk
APK := $(MOBILE)/android/app/build/outputs/apk/release/app-release.apk
BUILDS := $(MOBILE)/builds
VERSION := $(shell cat $(MOBILE)/VERSION)

apk-local: ## Build a release APK on this computer (64-bit ARM phones) into mobile/builds/, e.g. himma-v1.0.0-2026-09-28_21-30.apk
	cd $(MOBILE) && npx expo prebuild --platform android --no-install
	cd $(MOBILE)/android && $(ANDROID_ENV) ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
	@mkdir -p $(BUILDS)
	@out=$(BUILDS)/himma-v$(VERSION)-$$(date +%Y-%m-%d_%H-%M).apk && cp $(APK) $$out && echo "APK ready: $$out"

apk-install: ## Install the newest APK from mobile/builds/ on the phone plugged in over USB
	adb install -r "$$(ls -t $(BUILDS)/*.apk | head -1)"

lint: ## Lint the mobile app
	cd $(MOBILE) && npm run lint

typecheck: ## Type-check the mobile app
	cd $(MOBILE) && npm run typecheck

doctor: ## Check Expo config and dependency versions
	cd $(MOBILE) && npx expo-doctor

check: lint typecheck doctor ## Run lint, typecheck and doctor

clean: ## Delete node_modules and the Expo cache (run `make install` afterwards)
	rm -rf $(MOBILE)/node_modules $(MOBILE)/.expo
