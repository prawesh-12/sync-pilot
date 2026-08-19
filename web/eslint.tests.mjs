// The TypeScript half of the web app's ESLint setup, for the tests. They are
// plain Node modules, so core-web-vitals would only warn about a missing pages
// directory and an uninstalled React. It lives here because a config resolves
// its imports against its own directory, and the plugins are in web/.
import nextTs from "eslint-config-next/typescript";

export default nextTs;
