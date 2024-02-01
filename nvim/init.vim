

set number
set wrap

set tabstop=2
set shiftwidth=2
set expandtab " 4-spaces instead of tab indentation

set spell spelllang=en_us


function! RelativeFilePath()
    return substitute(expand('%'), '^' . getcwd() . '/', '', '')
endfunction

set winbar=%t\ 
set winbar+=%m

set statusline=%{RelativeFilePath()}\ 
set statusline+=%y\                     " File type
set statusline+=%=                      " Left/right separation
set statusline+=%l/%L,\ %c\                  " Line and column number

call plug#begin('~/.config/nvim/plugged/')

    " LSP
    Plug 'williamboman/mason.nvim'
        Plug 'williamboman/mason-lspconfig.nvim'
    Plug 'https://github.com/neovim/nvim-lspconfig'
    Plug 'https://github.com/hrsh7th/nvim-cmp'
        Plug 'hrsh7th/cmp-nvim-lsp'
        Plug 'hrsh7th/cmp-buffer'
        Plug 'hrsh7th/cmp-path'
        Plug 'hrsh7th/cmp-cmdline'
    Plug 'hrsh7th/cmp-vsnip'
        Plug 'hrsh7th/vim-vsnip'

    " Editing
    Plug 'https://github.com/NMAC427/guess-indent.nvim'
    Plug 'https://github.com/github/copilot.vim'

    " Debugging
    Plug 'https://github.com/mfussenegger/nvim-dap.git'
        "Plug 'https://github.com/Weissle/persistent-breakpoints.nvim'
        Plug 'https://github.com/rcarriga/nvim-dap-ui'
            Plug 'https://github.com/folke/neodev.nvim'
            Plug 'https://github.com/theHamsta/nvim-dap-virtual-text'
                Plug 'https://github.com/nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

    " Profiling
    Plug 'https://github.com/t-troebst/perfanno.nvim'

    " Project specific task running / compilation
    "Plug 'https://github.com/skywind3000/asynctasks.vim'
    "    Plug 'skywind3000/asyncrun.vim', {'on': ['AsyncRun', 'AsyncStop'] }
    "    Plug 'https://github.com/GustavoKatel/telescope-asynctasks.nvim'
    Plug 'https://github.com/stevearc/overseer.nvim'

    " Navigation
    Plug 'https://github.com/nvim-neo-tree/neo-tree.nvim'
        Plug 'nvim-lua/plenary.nvim'
        Plug 'nvim-tree/nvim-web-devicons'
        Plug 'MunifTanjim/nui.nvim'
    Plug 'nvim-telescope/telescope.nvim'

    " Other
    Plug 'rcarriga/nvim-notify'
    Plug 'https://github.com/catppuccin/nvim', { 'as': 'catppuccin' }
    Plug 'https://github.com/folke/which-key.nvim'
    Plug 'https://github.com/stevearc/dressing.nvim'
    Plug 'https://github.com/luukvbaal/statuscol.nvim'
        Plug 'https://github.com/lewis6991/gitsigns.nvim'

call plug#end()

lua require('init')
lua require('debugging')
lua require('lsp')
lua require('navigation')
lua require('keybinds')
lua require('profiling')
lua require('overseer_user')

"let g:asyncrun_open = 6  " Setup
"let g:asynctasks_confirm = 0  " Don't ask to name file
"let g:asynctasks_term_pos = 'bottom'  " Open terminal at bottom (not quickfix)


" TrueColor stuff
if !has('gui_running') && &term =~ '\%(screen\|tmux\)'
  let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
  let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
endif
set termguicolors
