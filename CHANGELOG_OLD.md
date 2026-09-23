# Older changes
## 3.0.5 (2025-01-20)

- upgrade jscontroller dependency

## 3.0.4 (2025-01-20)

- remove check for certifates in axios due to expired certificate of data provider

## 3.0.3 (2025-01-03)

- fix datapoint creation and overwriting states

## 3.0.2 (2025-01-02)

- improve debug messages

## 3.0.1 (2025-01-02)

- fix channel select dialog
- fix css classes

## 3.0.0 (2025-01-02)

- TVs as a device, this is a major change because all data points have to be deleted manually by the user
- improve datapoint creation

## 2.3.1 (2025-01-02)

- little docu fixes

## 2.3.0 (2025-01-02)

- add datapoint for optional channel icons
- add logic in the widgets

## 2.2.0 (2024-12-16)

- remove jquery-ui dependency
- fix dialog is visible on view switch, now it's modal
- fix adapter icon
- fix eslint errors
- switch some callbacks to promises
- remove unused code

## 2.1.0 (2024-11-24)

- Change sento command from getFavoritesDatax to getFavoritesData
- switch to eslint
- complete rework of tvprogram to switch from callback to await
- the widgets are now compatible with vis-2 (minimum vis-2 version ist 2.10)
- due to datapoint management, all datapoints should be deleted.

## 2.0.2 (2024-11-17)

- fix jsonconfig
- add node 22 to testing

## 2.0.1 (2024-11-16)

- fix lint errors

## 2.0.0 (2024-11-16)

- fix lint errors
- align structures and files
- switch to jsonconfig
- config translations
- make vis2 compatible (maybe some glitches included, please report)

## 1.1.1 (2021-08-10)

- remove dead code / extend doku about the warnings in the iobroker log \* change the method of setting for configuration data from widget to datapoint

## 1.1.0 (2021-05-06)

- tooltips for the buttons in the time widget / search through the whole text to also find directors and actors / add showpictures option in time,control and search widget / improve documentation

## 1.0.0

- (oweitman) stable version
