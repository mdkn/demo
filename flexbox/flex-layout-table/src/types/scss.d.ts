// M005: SCSS module type definitions
declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}
