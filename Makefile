BIKESHED = bikeshed

all: url.html

url.html: url.bs header.include logo.include copyright.include status.include Makefile
	$(BIKESHED) spec
