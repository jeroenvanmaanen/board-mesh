#!/bin/bash

metapost.sh -v -v mesh.mp

if [[ -f "mesh.1.ps" ]]
then
  ghostscript.sh -sDEVICE=pngalpha -dDEVICEWIDTHPOINTS=72 -dDEVICEHEIGHTPOINTS=72 -o mesh.1.png mesh.1.ps
fi
