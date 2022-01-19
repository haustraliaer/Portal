import React from 'react'
import Portal from '../Portal'

const BigOlPaddedDiv = (props) => (
  <div
    style={{
      paddingBottom: '4000px',
    }}>
    {props.children}
  </div>
)

const Popup = (
  <Portal
    popup    
    position="bottom right"
    align="center left"
    Button={(props) => (
      <button style={{ width: '100%' }} onClick={props.onToggle}>
        popup
      </button>
    )}>
    <div
      style={{
        background: '#DDB5B5',
        padding: '50px',
        minWidth: '600px',
      }}>
      this is a popup portal
    </div>
  </Portal>
)

const PortalInPortal = (
  <Portal
    fullscreen
    Button={(props) => <button onClick={props.onToggle}>open</button>}
    Children={(props) => (
      <BigOlPaddedDiv>
        <button onClick={props.onToggle}>close</button>
        <div>Portal in a portal - I could do this for days...</div>
        <div>Here, have a popup in a portal in a portal:</div>
        <div
          style={{ background: '#B3BFED', width: '200px', margin: '50px' }}>
          {Popup}
        </div>
      </BigOlPaddedDiv>
    )}
  />
)

const Examples = function() {

  return (
    <div style={{
      paddingBottom: '4000px',
      paddingTop: '60px',
      width: '600px',
      margin: '0 auto',
    }}>
      <Portal isOpen>basic - always open portal</Portal>

      <div
        style={{ background: '#B3BFED', width: '200px', margin: '50px' }}>
        {Popup}
      </div>

      <Portal
        fullscreen
        background="#F9A0A0"
        Button={(props) => <button onClick={props.onToggle}>open</button>}
        Children={(props) => (
          <BigOlPaddedDiv>
            <button onClick={props.onToggle}>close</button>
            <div>Fixed, fullscreen portal</div>
            {PortalInPortal}
          </BigOlPaddedDiv>
        )}
      />
    </div>
  )
}

export default Examples