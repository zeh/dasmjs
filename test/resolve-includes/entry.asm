; entry
	processor 6502

	incdir "subdir"

	include "simple.asm"
	include "insubdir.asm"

	org  $F000

	incbin "clock.bin"
