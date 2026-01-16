{
  inputs = {
    nixpkgs.url = "nixpkgs";
  };

  outputs =
    { self, ... }@inputs:
    let
      system = "x86_64-linux";
      pkgs = import inputs.nixpkgs { inherit system; };

    in
    {
      devShells = {
        ${system}.default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            just
            deno
          ];
        };
      };
    };
}
