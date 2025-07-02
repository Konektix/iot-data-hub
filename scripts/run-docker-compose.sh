#!/bin/bash

run_docker_compose()
{
	ARGUMENTS="$@"
	
	if $(docker compose &>/dev/null) && [ $? -eq 0 ]; then
		docker compose $ARGUMENTS
	elif [ -x "$(command -v docker-compose)" ]; then
		docker-compose $ARGUMENTS
	else
		echo "ERROR: neither \"docker compose\" nor \"docker-compose\" appear to be installed."
		exit 1
	fi
}