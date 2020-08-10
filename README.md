[![npm (tag)](https://img.shields.io/npm/v/might-ui/latest)](http://npmjs.com/package/might-ui)
![npm](https://img.shields.io/npm/dm/might-ui)

**This project is still new, issues are to be expected.**

## The Problem

End-to-end testing can get very complicated and overwhelming; especially if you need to start testing huge apps, that would take a lot of time and afford, and will be boring and repetitive.

## The Solution

A no-code method to perform and manage end-to-end tests, handling all of the mess in the background.

[Might UI](https://github.com/ItsKerolos/Might) is an easy way to create, manage and edit tests,
and [Might CLI](https://github.com/ItsKerolos/might-cli) runs those tests.

## Installation

##### IMPORTANT: This project depends on the experimental [Native File System API](https://web.dev/native-file-system/) which is currently only supported by Chrome 83+ and requires ```chrome://flags/#native-file-system-api``` to be enabled manually.

`npm install --save-dev might-cli might-ui`

## Usage
`npx might -m` or `npx might-ui`.

After that it opens automatically in your browser, **(to actually run the tests you need to use [might-cli](https://github.com/ItsKerolos/might-cli)).**

- [Waiting](https://github.com/ItsKerolos/Might/blob/master/src/documentation/wait.md)
- [Changing the Viewport](https://github.com/ItsKerolos/Might/blob/master/src/documentation/viewport.md)
- [Going to Different Pages](https://github.com/ItsKerolos/Might/blob/master/src/documentation/goto.md)
- [Setting Media Features](https://github.com/ItsKerolos/Might/blob/master/src/documentation/media.md)
- [Keypresses](https://github.com/ItsKerolos/Might/blob/master/src/documentation/click.md)
- [Hovering](https://github.com/ItsKerolos/Might/blob/master/src/documentation/hover.md)
- [Clicking](https://github.com/ItsKerolos/Might/blob/master/src/documentation/select.md)
- [Dragging Elements](https://github.com/ItsKerolos/Might/blob/master/src/documentation/drag.md)
- [Swiping the Screen](https://github.com/ItsKerolos/Might/blob/master/src/documentation/swipe.md)
- [Typing](https://github.com/ItsKerolos/Might/blob/master/src/documentation/keyboard.md)

[![](./screenshots/1.png)](https://github.com/ItsKerolos/Might/raw/master/screenshots/1.png)

[![](./screenshots/2.png)](https://github.com/ItsKerolos/Might/raw/master/screenshots/2.png)