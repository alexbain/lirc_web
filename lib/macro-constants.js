module.exports = {
  DEFAULT_DELAY: 50,
  STATE_SET: 'set',
  STATE_NOT_SET: 'clear',
  STATE_PENDING_SET: 'going_to_be_set',
  STATE_PENDING_RESET: 'going_to_be_clear',
  isStateDefined: function (value) {
    return value === this.STATE_NOT_SET
      || value === this.STATE_SET
      || value === this.STATE_PENDING_SET
      || value === this.STATE_PENDING_RESET;
  },
};
