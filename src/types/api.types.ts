// These types are written by hand because the assignment API ships no schema.
// To make this production ready I would suggest an OpenAPI specification
// (yaml or json) and generating the types from it, making it the single
// source of truth.

export interface Package {
  id: string;
  weeklyDownloads: number;
  dependencyCount: number;
}

export interface ApiTypes {
  getPackages: Package[];
}
