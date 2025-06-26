# dotfiles

Following https://www.jakewiesler.com/blog/managing-dotfiles

On a new machine:
```
git clone https://github.com/alexdalat/dotfiles/ ~/dotfiles
cd ~/dotfiles
sudo apt install stow
stow .
```

## Requirements:

### tmux:
 - tpm: `git clone https://github.com/tmux-plugins/tpm ~/.config/tmux/plugins/tpm` then `<Ctrl+b> I` inside an instance

### Neovim:
 - vim-plug: `sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'`
 - gcc
 - Node.js

## Optional:
 - nerdfonts (Hack)
