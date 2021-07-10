#!/usr/bin/python

import sys

print("%s" % sys.argv)

for item in sys.argv[1:]:
    print(">>> %s" % item)

answer = raw_input()
print("... %s" % answer)