{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_22
    pnpm
    typescript

    uv
  ];

  shellHook = ''
    echo "Agent experiments dev environment"
    echo "Node: $(node --version)"
    echo "pnpm: $(pnpm --version)"
    echo "TypeScript: $(tsc --version)"
  '';
}
