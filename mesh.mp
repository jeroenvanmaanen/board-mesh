% Mesh
beginfig(1);

transform to_center;
to_center = identity shifted (30mm, 30mm);

pickup pencircle scaled 1mm;
z101 = up * 20mm;
z102 = left * 20mm;
z103 = down * 20mm;
z104 = right * 20mm;
draw z101..z102..z103..z104..cycle transformed to_center withcolor red;

endfig;
end;

