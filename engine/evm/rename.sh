find . -type f | xargs grep -l $1 | xargs perl -p -i -e "s/$1/$2/g"
