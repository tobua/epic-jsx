import { createRoot } from './component'
import { debounce, log, multipleInstancesWarning, schedule } from './helper'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from './hooks'
// biome-ignore lint/style/noNamespaceImport: React compatibility.
import * as React from './jsx'
import { cloneElement, createElement, jsx, jsxDEV, jsxs } from './jsx'
import { process, processNow } from './render'
import { Fiber } from './types'
import type { Component, ComponentPropsWithoutRef, Context, CssProperties, Props, Ref, Refs, Type } from './types'
import type * as ReactType from './types/index'
import type { JSXSource } from './types/jsx-dev-runtime'
import type { JSX } from './types/jsx-runtime'

const Renderer: { context?: Context; effects: Function[]; current?: Fiber } = {
  context: undefined,
  effects: [],
  current: undefined,
}

export {
  createElement,
  jsx,
  jsxDEV,
  jsxs,
  cloneElement,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Renderer,
  debounce,
  useDeferredValue,
  useTransition,
}
export { Fiber }
export type { Props, Context, Component, CssProperties, Type, JSX, JSXSource, ComponentPropsWithoutRef, Ref, Refs }

// biome-ignore lint/style/noDefaultExport: React compatibility.
export default React as unknown as typeof ReactType

const roots = new Map<HTMLElement, Context>()

// Imported by regular React runtime, implementation is guess.
// @ts-ignore
export const Fragment: typeof ReactType.Fragment = undefined // Symbol.for('react.fragment')

export const getRoot = (container: HTMLElement = document.body) => {
  if (!roots.has(container)) {
    return
  }
  const context = roots.get(container)
  // Ensure all work has passed.
  if (context && (context.pending.length > 0 || context.rendered.length > 0)) {
    processNow(context)
  }
  return context
}

export const getRoots = () => {
  const contexts = [...roots.values()]
  // Ensure all work has passed.
  for (const context of contexts) {
    if (context.pending.length > 0 || context.rendered.length > 0) {
      processNow(context)
    }
  }
  return contexts
}

export const unmount = (container: HTMLElement) => {
  if (!container) {
    log('Trying to unmount empty container', 'warning')
    return
  }

  container.innerHTML = ''

  const context = getRoot(container)

  if (!context) {
    return
  }

  roots.delete(container)
}

export const unmountAll = () => roots.forEach((_, container) => unmount(container))

export function render(element: ReactType.JSX.Element, container?: HTMLElement | null) {
  if (!container) {
    // biome-ignore lint/style/noParameterAssign: Why wouldn't a method default work?
    container = document.body // Default assignment in args wouldn't override null.
  }

  if (roots.has(container)) {
    unmount(container)
  } else {
    container.innerHTML = '' // Always clearing the container first.
  }

  const root = createRoot(container, element, unmount)

  const context: Context = {
    root,
    deletions: [],
    current: undefined,
    dependencies: new Map<Function, any[]>(),
    pending: [root],
    rendered: [],
    afterListeners: [],
  }

  roots.set(container, context)
  context.deletions = []
  schedule((deadline) => process(deadline, context))
  return context
}

multipleInstancesWarning()
