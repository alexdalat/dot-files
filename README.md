# dot-files

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
 - tpm: `git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm`
 - nerdfonts

### Neovim:
 - vim-plug: `sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
       https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'`
 - gcc
 - Node.js
