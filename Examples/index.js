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
    closeOnClick    
    position="bottom right"
    align="center left"
    Button={(props) => (
      <button style={{ width: '100%' }} onClick={props.onToggle}>
        popup 1
      </button>
    )}>
      <div
        style={{
          background: '#DDB5B5',
          padding: '50px',
          minWidth: '600px',
        }}>
        this is a popup portal

        <div
          style={{ background: '#B3BFED', width: '200px', margin: '50px' }}>
          <Portal
            popup
            closeOnClick    
            position="bottom right"
            align="center left"
            Button={(props) => (
              <button style={{ width: '100%' }} onClick={props.onToggle}>
                popup 2
              </button>
            )}>
              <div
                style={{
                  background: '#ddc509',
                  padding: '50px',
                  minWidth: '600px',
                }}>
                this is a popup in a popup!
              </div>
          </Portal>
        </div>
      </div>
  </Portal>
)

const PortalInPortal = (
  <Portal
    fullscreen
    Button={({onToggle}) => (
      <button onClick={onToggle}>open</button>
    )}>
      {({onToggle}) => (
      <BigOlPaddedDiv>
        <button onClick={onToggle}>close</button>
        <div>Portal in a portal - I could do this for days...</div>
        <div>Here, have a popup in a portal in a portal:</div>
        <div
          style={{ background: '#B3BFED', width: '200px', margin: '50px' }}>
          {Popup}
        </div>
      </BigOlPaddedDiv>
    )}
  </Portal>
  
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
        Button={({onToggle}) => (
          <button onClick={onToggle}>open</button>
        )}>
          {({onToggle}) => (
            <BigOlPaddedDiv>
              <button onClick={onToggle}>close</button>
              <div>Fixed, fullscreen portal</div>
              {PortalInPortal}
            </BigOlPaddedDiv>
          )}
      </Portal>
    </div>
  )
}

export default Examples