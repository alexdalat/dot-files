

set number
set wrap

set tabstop=4
set shiftwidth=4
set expandtab " 4-spaces instead of tab indentation


function! RelativeFilePath()
    return substitute(expand('%'), '^' . getcwd() . '/', '', '')
endfunction

set winbar=%t\ 
set winbar+=%m

set statusline=%{RelativeFilePath()}\ 
set statusline+=%y\                     " File type
set statusline+=%=                      " Left/right separation
set statusline+=%l,%c\                  " Line and column number
set statusline+=\ [%p%%]\               " Percentage through the file
set statusline+=\ %L\                   " Total number of lines



call plug#begin('~/.config/nvim/plugged/')

    " LSP
    Plug 'https://github.com/neovim/nvim-lspconfig'
    Plug 'https://github.com/hrsh7th/nvim-cmp'
        Plug 'hrsh7th/cmp-nvim-lsp'
        Plug 'hrsh7th/cmp-buffer'
        Plug 'hrsh7th/cmp-path'
        Plug 'hrsh7th/cmp-cmdline'

    Plug 'hrsh7th/cmp-vsnip'
        Plug 'hrsh7th/vim-vsnip'

    Plug 'https://github.com/github/copilot.vim'

    " Debugging
    Plug 'https://github.com/mfussenegger/nvim-dap.git'
        Plug 'https://github.com/Weissle/persistent-breakpoints.nvim'
        Plug 'https://github.com/rcarriga/nvim-dap-ui'
            Plug 'https://github.com/folke/neodev.nvim'
            Plug 'https://github.com/theHamsta/nvim-dap-virtual-text'
                Plug 'https://github.com/nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

    " Project specific task running / compilation
    Plug 'skywind3000/asynctasks.vim'
        Plug 'skywind3000/asyncrun.vim'


    " Themes
    Plug 'https://github.com/catppuccin/nvim', { 'as': 'catppuccin' }

    " Navigation
    Plug 'https://github.com/nvim-neo-tree/neo-tree.nvim'
        Plug 'nvim-lua/plenary.nvim'
        Plug 'nvim-tree/nvim-web-devicons'
        Plug 'MunifTanjim/nui.nvim'

    Plug 'https://github.com/ibhagwan/fzf-lua', {'branch': 'main'}
        Plug 'https://github.com/junegunn/fzf', { 'do': 'yes \| ./install' }

    " Editing
    Plug 'https://github.com/NMAC427/guess-indent.nvim'

call plug#end()


lua require('config')
lua require('debugging')
lua require('lsp')
lua require('navigation')
lua require('keybinds')


" Startup
colorscheme catppuccin-mocha

let g:asyncrun_open = 6


" TrueColor stuff
if !has('gui_running') && &term =~ '\%(screen\|tmux\)'
  let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
endif
set termguicolors
