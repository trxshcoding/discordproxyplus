# SPDX-FileCopyrightText: 2026 Name <evelyn@willalways.top>
#
# SPDX-License-Identifier: EUPL-1.2

{
  description = "discordproxyplus: proxies discord information without a token";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
    }:
    {
      devShells =
        nixpkgs.lib.genAttrs
          [
            "x86_64-linux"
            "aarch64-linux"
            "x86_64-darwin"
            "aarch64-darwin"
          ]
          (
            system:
            let
              pkgs = nixpkgs.legacyPackages.${system};
            in
            {
              default = pkgs.mkShell {
                nativeBuildInputs = with pkgs; [
                  # TS tooling
                  nodejs_24
                  pnpm
                  typescript
                  typescript-language-server

                  # Linter
                  oxlint
                  reuse # Checks for the correct licensing.
                ];
              };
            }
          );
    };
}
