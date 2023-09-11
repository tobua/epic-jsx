# How React Works

## Rendering Stages

### JSX

Turns nested `createElement` calls into a basic tree structure.

### Render

Render tree of `Node`s by executing components recursively.

### Reconciliation

Compares updated tree with previous tree and determines necessary changes.

### Commit

Changes to Nodes are synced with the native implementation.
