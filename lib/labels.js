module.exports = function Labels(remoteLabels, commandLabels) {
  function getCommandLabel(remote, command) {
    return commandLabels && commandLabels[remote] && commandLabels[remote][command] ? commandLabels[remote][command] : command;
  }

  function getRemoteLabel(remote) {
    return remoteLabels && remoteLabels[remote] ? remoteLabels[remote] : remote;
  }

  return {
    command: getCommandLabel,
    remote: getRemoteLabel,
  };
};
