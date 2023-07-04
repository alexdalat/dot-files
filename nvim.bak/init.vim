
" Settings
set number


" Plugins (PlugInstall)
call plug#begin()

Plug 'catppuccin/nvim', { 'as': 'catppuccin' }
Plug 'numToStr/Comment.nvim'
Plug 'nvim-tree/nvim-web-devicons' " optional
Plug 'nvim-tree/nvim-tree.lua'

call plug#end()

set termguicolors
colorscheme catppuccin-macchiato

" Plugin setup
lua << EOF
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1
vim.o.termguicolors = true
require("nvim-tree").setup()

require('Comment').setup()

EOF
