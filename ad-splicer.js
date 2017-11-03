let clone = require('lodash.clonedeep');

AdSplicer = (episode, campaign) => {
	// kick it off
	init(episode, campaign);
}

sortByRevenue = (campaign) => {
	// deep copy object so we don't modify the original
	let newCampaign = clone(campaign);
	return newCampaign.sort((a, b) => {
		return a.revenue < b.revenue;
	});
}

spliceAudio = (ep) => {
	// match all characters, removing brackets
	return ep.match(/\w+|\++/g);
}

replaceAudioWithAds = (audio, campaign) => {
	// loop over audio array matching ad types to slots
	audio.forEach((currentAudio, idx, audioArr) => {
		campaign.forEach((camp, cIndex, cArray) => {
			// if there's a match replace the placeholder
			// and remove that ad from the campaign rotation
			if(camp.type === currentAudio) {
				audioArr[idx] = camp.audio;
				cArray.splice(cIndex, 1);
			}
		});
	});

	return audio;
}

validateTargets = (episode, campaign) => {
	let validated = false;
	// loop over campaigns to match targets to IDs

	campaign.forEach((camp, idx) => {
		camp.targets.forEach((target) => {
			if(target === episode.id) {
				// if matched, set flag to true
				validated = true;
			}
		});
	});
	return validated;
}

stripRemainingSlots = (audio) => {
	// filter out extra placeholder values
	return audio.filter((a) => {
		// returns 0 or higher if match
		if(a.indexOf('*') > -1 || a.indexOf('+') > -1) {
			return true;
		}
		else return false;
	});

}

concatAudio = (audio) => {
	if(audio.length) {
		return audio.join('');
	}
	else return audio;
}

init = (episode, campaign) => {
	// order by highest revenue ads first
	let sortedCampaign = sortByRevenue(campaign)
	
	// splice the audio string into an array
	episode.audio = spliceAudio(episode.audio);
	
	// match campaign targets to ads
	let validated = validateTargets(episode, sortedCampaign);
	
	// run the splicer functions if the campaign matches the episode id
	if(validated) {
		episode.audio = replaceAudioWithAds(episode.audio, campaign);
		episode.audio = stripRemainingSlots(episode.audio);
		episode.audio = concatAudio(episode.audio);
		console.log('After processing:');
		console.log(`Episode ${episode.id} audio: ${episode.audio}`);
	}
	else {
		console.error(`No matching targets for ${episode.id}`);
	}

}

module.exports = AdSplicer;