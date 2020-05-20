# Quovadis

Quovadis is a lightweight JavaScript library to facilitate dealing with changes in scroll-direction. It is based on the [scroll-intent](https://github.com/pwfisher/scroll-intent.js) plugin by [pwfisher](https://github.com/pwfisher) with some key differences:

- no jQuery dependency 🙅‍♂️
- offers automatic orientation detection 🔮
- allows setting of a custom scroll target element 🎯
- allows targetting horizontal scroll ↔️
- sets classes on the html element instead of data-attributes ✌️
- dispatches `scrollDirectionChange` event when scroll-direction changes 🚨

Have any suggestions or feedback? [Reach out!](mailto:mail@timjuedemann.de)

## Installation
### Install via npm
```js
npm install quovadis
```

### Download and include via script tag
```html
<script src="quovadis.min.js"></script>
```

or

### Using `import` statement
```jss
import Quovadis from 'quovadis';
```

## Usage
### JS
Initialize Quovadis by creating a new Quovadis instance.

```js
var q = new Quovadis();
q.attach();
```

Quovadis accepts a list of options. Passing no options (as in the example above) defaults to:

```js
var q = new Quovadis({
    context: document.documentElement,
    horizontal: 'auto',
    event: true,
    historyLength: 32,
    historyMaxAge: 512,
    thresholdPixels: 64
});
```

### Orientation Detection
If no value is passed to the `horizontal` option, Quovadis will try to figure out the scroll direction by comparing the position of any **non-positioned** lastElementChild of the `context` to the `context` itself.

### Output
By default, Quovadis will automatically add and remove classes on the html element based on scroll direction, i.e. `scrolling-down` and `scrolling-up` or `scrolling-right` and `scrolling-left` when working in horizontal mode.

### Event
Unless set to do otherwise, Quovadis will also dispatch a `scrollDirectionChange` event to the window element. This event can be used to set up your own callback functions to fire once scroll direction changes.

```js
window.addEventListener('scrollDirectionChange', function(e) {
	switch (e.detail.direction) {
		case 'up':
			/* stuff to do when scrolling up */
			break;
		case 'down':
			/* stuff to do when scrolling down */
			break;
		case 'left':
			/* stuff to do when scrolling left */
			break;
		case 'right':
			/* stuff to do when scrolling right */
			break;
	}
});
```

## Options

| Property | Type | Description | Default  |
|---------------------------|-------------|---------------|---------|
| `context` | Element | Sets the element to listen to scroll events on. | `window` |
| `horizontal` | Boolean/String | Set this to `true` to explicitly target horizontal scrolling. In `auto` mode, Quovadis will try to figure out the orientation on its own. | `'auto'` |
| `event` | Boolean | Determines whether Quovadis should fire a `scrollDirectionChange` event when scroll direction changes. | `true` |
| `debug` | Boolean | Enables debug mode which will output information about the currently active Quovadis instance to the console. | `false` |
| `historyLength` | Number | The number of records to keep to determine the scroll direction. | `32` |
| `historyMaxAge` | Number | The maximum duration for a record to determine the scroll direction. | `512` |
| `thresholdPixels` | Number | The number of pixels to scroll before re-evaluating the direction | `64` |

## Methods

| Method | Description  |
|---------------------------|-------------|---------------|---------|
| `attach()` | Initializes the Quovadis instance. This is also the function that returns the EventListener for the scroll context. |
| `detach()` | Removes the EventListener from the Quovadis instance. |
| `reattach(el)` | Attaches the Quovadis EventListener to a new scroll context. This is useful when working with dynamic AJAX content. Accepts an element parameter. |

## License

This project is licensed under the MIT License.