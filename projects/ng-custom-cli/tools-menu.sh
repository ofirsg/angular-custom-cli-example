#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"
. ascii.sh --source-only

menu() {
  echo -ne "
  Select tool:
      (1) add-page-layout: generate new page layout and insert it to existing component

      (0) Exit

  Choose an option: "
  read -r a
  case $a in
  1)
    ngAddPageLayout
    menu
    ;;

  0) exit 0 ;;
  *)
    echo "

! Bad option input !
			"
    menu
    ;;
  esac
}

ngAddPageLayout() {
echo "  add page layout
"
ng g ng-custom-cli:apl
}

menu
