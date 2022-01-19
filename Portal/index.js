import React, { createContext } from 'react'
import ReactDOM from 'react-dom'

import {
  getPopupCoords,
  openFullscreenPortal,
  closeFullscreenPortal,
  openClickEventPortal,
  checkDomTargetPath
} from './portal-utils.js'

// this is the element context for fullscreen portals
export const scrollContext = createContext({})

// this is the parent context for any given portal
export const portalContext = createContext({})

// combine the above for some multi-portal shenanegans
export const CombinedPortalContext = createContext({})

class Portal extends React.Component {
  constructor(props) {
    super(props)

    this.closeOnClickId = undefined
    this.childRefs = []

    this.buttonRef = null
    this.contentRef = null

    this.node = document.createElement('div')

    if (props.fullscreen) {
      let _position = 'fixed'
      if (props.isContained) {
        _position = 'absolute'
      }

      this.node.className += ' scroll-touch'
      this.node.style.cssText = `
        position: ${_position};
        z-index: 1;
        top: 0;
        height: auto;
        bottom: 0;
        left: 0;
        right: 0;
        overflow-y: ${props.noscroll ? 'hidden' : 'scroll'};
        background: ${props.background || 'rgba(255,255,255,0.9)'};
      `
    }

    this.element = props.element || props.scrollNode || document.body
  }

  setContentRef = (element) => {
    this.contentRef = element
  }

  setCoords = () => {
    const { popup, buttonRef, position } = this.props

    if (popup && this.buttonRef === null) {
      this.buttonRef = buttonRef

      const coords = getPopupCoords(buttonRef)

      const _pArr = position || 'top left'
      const positions = _pArr.split(' ')
      const top = positions[0]
      const left = positions[1]

      this.node.style.cssText = `
        position: absolute;
        z-index: 1;
        top: ${coords[top === 'center' ? 'yCenter' : top]}px;
        left: ${coords[left === 'center' ? 'xCenter' : left]}px;
      `
    }
  }

  componentWillMount() {
    const { 
      fullscreen, 
      isContained, 
      closeOnClick, 
      parentId 
    } = this.props

    if (closeOnClick) {
      document.addEventListener('click', this.handleClick)

      // get children to check click events
      const {
        id, // set this to context for the next portal child
        childRefs, // use this in the click event check
      } = openClickEventPortal({
        node: this.node,
        parentId: parentId,
      })

      this.closeOnClickId = id
      this.childRefs = childRefs
    }

    this.element.appendChild(this.node)

    // add portalId to manager
    if (fullscreen) {
      this.portalId = openFullscreenPortal({
        node: this.element,
        isContained,
      })
    }
  }

  componentWillUnmount() {
    const { fullscreen, closeOnClick, isContained } = this.props

    if (closeOnClick)
      document.removeEventListener('click', this.handleClick)

    // remove portal id from manager
    this.element.removeChild(this.node)
    if (fullscreen) {
      closeFullscreenPortal({
        portalId: this.portalId,
        node: this.element,
        isContained,
      })
    }
  }

  handleClick = (event) => {
    const { onClose } = this.props

    const childRefs = this.childRefs || []

    const targetIsInPortalPath = childRefs.reduce((__bool, ref) => {
      return __bool || checkDomTargetPath(event, ref)
    }, false)

    const targetIsPopup = checkDomTargetPath(event, this.contentRef)

    if (targetIsPopup || targetIsInPortalPath) return

    return onClose()
  }

  render() {
    const {
      children,
      fullscreen,
      modal,
      Children,
      onToggle,
      onClose,
      onOpen,
      popup,
      align,
    } = this.props

    const portalFns = {
      onToggle,
      onClose,
      onOpen,
    }

    this.setCoords()

    let ChildComponent = children

    if (typeof children === 'function') {
      ChildComponent = children(portalFns)
    }

    if (Children) {
      ChildComponent = <Children {...portalFns} />
    }

    let PortalComponent = ChildComponent

    if (fullscreen) {
      PortalComponent = (
        <scrollContext.Provider value={{ scrollNode: this.node }}>
          {ChildComponent}
        </scrollContext.Provider>
      )

      if (modal) {
        PortalComponent = (
          <scrollContext.Provider value={{ scrollNode: this.node }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100%',
              }}
            >
              {ChildComponent}
            </div>
          </scrollContext.Provider>
        )
      }
    }

    if (popup && align) {
      const alignArr = align.split(' ')
      const y = alignArr[0]
      const x = alignArr[1]

      const alignment = {
        top: y === 'top' || y === 'center' ? 0 : undefined,
        bottom: y === 'bottom' ? 0 : undefined,
        left: x === 'left' || x === 'center' ? 0 : undefined,
        right: x === 'right' ? 0 : undefined,
        transform: `
          ${x === 'center' ? 'translateX(-50%)' : ''}
          ${y === 'center' ? 'translateY(-50%)' : ''}
        `,
      }

      PortalComponent = (
        <div
          ref={this.setContentRef}
          style={{
            position: 'absolute',
            zIndex: 1,
            ...alignment,
          }}
        >
          {ChildComponent}
        </div>
      )
    }

    return ReactDOM.createPortal(
      <portalContext.Provider value={{ parentId: this.closeOnClickId }}>
        {PortalComponent}
      </portalContext.Provider>,
      this.node
    )
  }
}

const ProvideCombinedContext = (props) => {
  return (
    <scrollContext.Consumer>
      {(scrollContext) => (
        <portalContext.Consumer>
          {(portalContext) => (
            <CombinedPortalContext.Provider
              value={{
                scrollNode: scrollContext.scrollNode,
                isContained: scrollContext.isContained,
                parentId: portalContext.parentId,
              }}
            >
              {props.children}
            </CombinedPortalContext.Provider>
          )}
        </portalContext.Consumer>
      )}
    </scrollContext.Consumer>
  )
}

class Door extends React.Component {
  static contextType = CombinedPortalContext

  constructor(props) {
    super(props)

    this.state = {
      isOpen: props.isOpen,
      buttonRef: null,
    }

    this.buttonRef = null
  }

  shouldComponentUpdate(nextProps) {
    return !this.props.useExternalState || nextProps.isOpen !== this.props.isOpen
  }

  setButtonRef = (element) => {
    this.buttonRef = element

    this.setState(() => ({
      buttonRef: element,
    }))
  }

  handleToggle = () => {
    const { isOpen } = this.state
    if (isOpen) return this.handleClose()
    return this.handleOpen()
  }

  handleOpen = () => {
    this.setState(() => ({
      isOpen: true,
    }))
  }

  handleClose = () => {
    const { handleOnClose } = this.props
    if (typeof handleOnClose === 'function') {
      handleOnClose()
    }

    this.setState(() => ({
      isOpen: false,
    }))
  }

  render() {
    const { Button, onToggle, onClose, onOpen, useExternalState, popup } =
      this.props

    const isOpen = useExternalState ? this.props.isOpen : this.state.isOpen

    const portalFns = {
      onToggle: useExternalState ? onToggle : this.handleToggle,
      onClose: useExternalState ? onClose : this.handleClose,
      onOpen: useExternalState ? onOpen : this.handleOpen,
    }

    // TODO: allow the button to set itself as the ref when using popup?
    // ... pretty sure the ref is only used for popups
    let _button = null

    if (Button) {
      _button = <Button {...portalFns} isOpen={isOpen} />

      if (popup) {
        _button = (
          <div ref={this.setButtonRef}>
            <Button {...portalFns} isOpen={isOpen} />
          </div>
        )
      }
    }

    const _portal = !isOpen ? null : (
      <Portal
        {...this.props}
        {...portalFns}
        isOpen={isOpen}
        buttonRef={this.state.buttonRef}
        scrollNode={this.context.scrollNode}
        parentId={this.context.parentId}
        isContained={this.context.isContained}
      />
    )

    return (
      <React.Fragment>
        {_button}
        {_portal}
      </React.Fragment>
    )
  }
}

const WrappedNeeds2Contexts = (props) => (
  <ProvideCombinedContext>
    <Door {...props} />
  </ProvideCombinedContext>
)

export default WrappedNeeds2Contexts