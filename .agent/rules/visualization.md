# Rule: Visual Problem Solving 📊

## Goal

Reduce cognitive load and prevent architectural mistakes by visualizing complex structures before writing code.

## Guidelines

- **Mermaid First**: Whenever asked to design a complex system (e.g., a database schema, an authentication flow, or a multi-step form), you MUST generate a `mermaid` diagram in your implementation plan before writing any code.
- **Visual Validation**: Present the diagram to the user. Wait for the user to confirm that the visual flow matches their mental model before proceeding to execution.
- **Diagram Types**:
  - Use `erDiagram` for Supabase database schemas.
  - Use `stateDiagram-v2` or `sequenceDiagram` for React state flows and TanStack Query data fetching logic.
  - Use `flowchart` for user navigation and routing paths.
- **Updates**: If the architecture changes during development, update the corresponding mermaid diagram in the documentation.
