# Portal
A pretty neat portal utility, I think.

## Usage

```js
import React, {useState} from 'react'
import Portal from 'Portal'

function PopupExample() {
  return ( 
    <Portal
      popup  
      position="bottom right"
      align="center left"
      Button={({onToggle}) => (
        <button onClick={onToggle}>
          open portal
        </button>
      )}>
        <div>
          This will position itself to the bottom right of the button element.
          And align itself, vertically centered and left (so the content will flow out to the right.)
        </div>
    </Portal>
  )
}


function FullscreenExample() {
  return ( 
    <Portal
      fullscreen
      background="#F9A0A0"
      Button={({onToggle}) => (
        <button onClick={onToggle}>open portal</button>
      )}>
        {({onClose}) => (
          <div>
            <button onClick={onClose}>close</button>
            <div>Fixed, fullscreen portal, which overrides the scroll of the current context (in this case, the body)</div>
          </div>
        )}
    </Portal>
  )
}


function ExternalStateExample() {
  const [isOpen, toggleOpen] = useState(false)
  return (
    <div>
      <button onClick={toggleOpen}>open portal</button>
    
      <Portal
        fullscreen
        isOpen={isOpen}
        background="#F9A0A0">
          <div>
            <button onClick={toggleOpen}>close</button>
            <div>this portal is driven by external state</div>
          </div>
      </Portal>  
    </div>
  )
}
```

## Props

`element` (DOM node - optional): used for the position in the DOM tree where the portal content (and any wrapping elements) will render. Defaults to the `document.body`. 

`isOpen` (bool - optional): sets the initial state - and controls it if `useExternalState={true}`

`useExternalState` (bool - optional): allows control of the `isOpen` state and accepts the `onToggle`, `onOpen`, `onClose` functions from above.

`isContained`

`fullscreen` (bool - optional): sets up an internal element which is `position: 'fixed'` and fullscreen, overlaying the current scroll context and removing it's scrollability.

`background` (string - optional): only used in fullscreen mode - defaults to `'rgba(255,255,255,0.9)'`, accepts anything you could use for the css background attribute.

`noscroll` (bool - optional): because the fullscreen mode wraps the portal content in an element which can't be controlled - this option prevents it from scrolling, which is useful in some cases.

`popup` (bool - optional): uses the `<span>` tag wrapping the `Button` element as a _reference_ point for absolute positioning of the portal contents, taking into account the current viewport of the browser. 

^^ makes use of the following two props in order to create the initial position of your portal content... without thinking to hard:

`position` (string - optional): defaults to "top left", which means the portal content will be positioned to the top left corner of the reference element. Can be any combination of `"top|bottom|center left|right|center"`

`align` (string - optional): defaults to "top left", which means the popup's top left corner will be _aligned_ to the `position` defined. Can be any combination of `"top|bottom|center left|right|center"`

`closeOnClick` (bool - optional): establishes a click event which listens for any clicks that are _outside_ the contents of your portal, running the `onClose` method if that's the case.

`Button` (fn - optional): Render prop method for passing in a custom button component. This will render immediately in the current React tree / dom position and be wrapped in a `<span>` tag to provide a ref for the popup target. The function has access to the following args:
- `isOpen` (bool): internal state, if you're not passing in from above
- `onToggle` (fn): toggles the internal `isOpen` state of the portal
- `onOpen` (fn): sets internal `isOpen` to true
- `onClose` (fn): sets internal `isOpen` to false

`children` (fn): pass anything into the portal via the standard React children method, which can just be JSX, but use a wrapping function to access the same internal props as the `Button`.


Note: I originally used a `Children` renderProp - but found this to cause re-renders in some cases.
