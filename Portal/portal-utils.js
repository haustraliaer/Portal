var fullScreenCounter = 0
var fullscreenList = []

var scrollDiv = document.createElement("div");
scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;');
document.body.appendChild(scrollDiv);

// Get the scrollbar width
var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

// Delete the DIV
document.body.removeChild(scrollDiv);

function getScrollbarWidth() {
  return scrollbarWidth;
}

function createFakeScrollbar() {
  const element = document.createElement('div')

  element.classList.add('portal-fake-scrollbar')
  element.style.cssText = `
    display: none;
    position: fixed;
    z-index: 1;
    top: 0;
    bottom: 0;
    right: 0;
    width: ${getScrollbarWidth()}px;
    overflow-y: scroll;
    overflow-x: hidden;
  `
  return element
}

function removeBodyScroll(node) {
  const element = node || document.getElementsByTagName('body')[0]
  const scrollTop = node
    ? element.scrollTop
    : window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
  const scrollHeight = element.scrollHeight

  element.style.paddingRight = `${getScrollbarWidth()}px`
  element.style.overflowY = 'hidden'

  let fakeScrollbar = element.getElementsByClassName(
    'portal-fake-scrollbar'
  )[0]

  if (!fakeScrollbar) {
    fakeScrollbar = createFakeScrollbar()
    element.insertBefore(fakeScrollbar, element.firstChild)
  }

  fakeScrollbar.style.display = 'block'
  fakeScrollbar.innerHTML = `<div style='height: ${scrollHeight}px'></div>`
  fakeScrollbar.scrollTop = scrollTop
}

function restoreBodyScroll(node) {
  const element = node || document.getElementsByTagName('body')[0]

  element.style.paddingRight = 0
  element.style.overflowY = !node ? '' : 'scroll'

  const fakeScrollbar = element.getElementsByClassName(
    'portal-fake-scrollbar'
  )[0]

  if (fakeScrollbar) {
    fakeScrollbar.style.display = 'none'
  }
}

export function openFullscreenPortal({ node, isContained }) {
  if (isContained) return

  const newId = fullScreenCounter + 1
  fullScreenCounter++

  if (fullscreenList.length === 0) {
    removeBodyScroll(node)
  }

  fullscreenList.push(newId)

  return newId
}

export function closeFullscreenPortal({
  portalId,
  node,
  isContained,
}) {
  if (isContained) return
  fullscreenList = fullscreenList.filter((id) => id !== portalId)

  if (fullscreenList.length === 0) {
    return restoreBodyScroll(node)
  }
}

var clickEventCounter = 0
var portalCache = {}

export function openClickEventPortal({ node, parentId }) {
  const newId = clickEventCounter + 1
  clickEventCounter++

  portalCache[newId] = { parentId, children: [] }

  recursivelyPushToParent(node, parentId)

  return {
    id: newId,
    childRefs: portalCache[newId].children,
  }
}

function recursivelyPushToParent(node, parentId) {
  const parentRef = portalCache[parentId]

  if (parentRef) {
    parentRef.children.push(node)

    if (parentRef.parentId) {
      recursivelyPushToParent(node, parentRef.parentId)
    }
  }
}

export function getPopupCoords(elem) {
  if (!elem) return {}

  var box = elem.getBoundingClientRect()

  var body = document.body
  var docEl = document.documentElement

  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft

  var clientTop = docEl.clientTop || body.clientTop || 0
  var clientLeft = docEl.clientLeft || body.clientLeft || 0

  var top = box.top + scrollTop - clientTop
  var left = box.left + scrollLeft - clientLeft
  var bottom = box.bottom + scrollTop - clientTop
  var right = box.right + scrollLeft - clientLeft

  return {
    top: Math.round(top),
    left: Math.round(left),
    bottom: Math.round(bottom),
    right: Math.round(right),
    xCenter: Math.round(left) + elem.offsetWidth / 2,
    yCenter: Math.round(top) + elem.offsetHeight / 2,
  }
}

export function checkDomTargetPath(evt, node) {
  const _evt = evt.nativeEvent || evt // account for React evts from onClick etc
  const { target, path, composedPath } = _evt

  const _path = path || composedPath ? _evt.composedPath() : []

  if (target === node) return true

  const targetIndex = _path.indexOf(target)
  const nodeIndex = _path.indexOf(node)

  if (targetIndex === -1 || nodeIndex === -1) return false

  if (targetIndex <= nodeIndex) return true

  return false
}
