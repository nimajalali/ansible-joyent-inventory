#! /usr/local/bin/node

var fs = require('fs'),
	smartdc = require('smartdc'),
	privateKey = fs.readFileSync('/Users/nimajalali/.ssh/id_rsa', 'utf8'),
	publicKey = fs.readFileSync('/Users/nimajalali/.ssh/id_rsa.pub', 'utf8'),
	fingerprint = require('ssh-fingerprint')(publicKey);

var signer = {
		key: privateKey,
		keyId: fingerprint,
		user: 'core.veritone'
	},
	connectionInformation = {
		sign: smartdc.privateKeySigner(signer),
		user: 'core.veritone',
		url: 'https://us-west-1.api.joyentcloud.com',
		noCache: true
	},
	client = smartdc.createClient(connectionInformation);

client.listMachines(function(err, machines) {
	if (err) {
		return console.error(err);
	}

	var ansibleInventoryObject = {};
	var ansibleHostVars =  {};

	machines.forEach(function forEachMachine(machine) {
		ansibleInventoryObject[machine.name] = [machine.primaryIp];

		ansibleHostVars[machine.name] = {
			ansible_host: machine.primaryIp,
			ips: machine.ips,
			tags: machine.tags,
			id: machine.id,
			type: machine.type,
			brand: machine.brand,
			state: machine.state,
			image: machine.image,
			memory: machine.memory,
			disk: machine.disk,
			networks: machine.networks,
			compute_node: machine.compute_node,
			package: machine.package
		};
	});

	ansibleInventoryObject["_meta"] = {
		"hostvars": ansibleHostVars
	};

	console.log(JSON.stringify(ansibleInventoryObject));
});