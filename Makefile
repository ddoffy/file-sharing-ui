build-ui:
	sudo docker build -t file-sharing-ui -f dockerfile .
build-ui-local:
	sudo docker build -t file-sharing-ui-local -f dockerfile.local .
run-ui:
	sudo docker run -d --network host --name file-sharing-ui --restart unless-stopped file-sharing-ui
run-ui-local:
	sudo docker run -d --network host --name file-sharing-ui-local --restart unless-stopped file-sharing-ui-local
stop-ui:
	sudo docker stop file-sharing-ui
stop-ui-local:
	sudo docker stop file-sharing-ui-local
remove-ui:
	sudo docker rm file-sharing-ui
remove-ui-local:
	sudo docker rm file-sharing-ui-local
logs-ui:
	sudo docker logs -f file-sharing-ui
logs-ui-local:
	sudo docker logs -f file-sharing-ui-local
build-both: build-ui build-ui-local
run-both: run-ui run-ui-local
stop-both: stop-ui stop-ui-local
remove-both: remove-ui remove-ui-local
logs-both: logs-ui logs-ui-local
all: build-both stop-both remove-both run-both


.PHONY: build-ui build-ui-local stop-ui stop-ui-local remove-ui remove-ui-local run-ui run-ui-local

// What is the use of .PHONY in makefile?
// .PHONY is a special target in makefile that is used to declare a target that does not represent a file.
// When you run make, it checks if the target is a file and if it is up to date. If it is not a file, it will always run the target.
// This is useful for targets that do not represent files, such as clean, build, run, etc.
// By declaring a target as .PHONY, you ensure that make will always run the target, even if there is a file with the same name.
// This is useful for targets that are used to run commands, such as build, run, clean, etc.
