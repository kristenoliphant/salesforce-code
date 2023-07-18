trigger DeleteOldTasks on Task (before insert, before update, after insert, after update) {
	List<Task> oldTasks = [Select ID from Task where CreatedDate < YESTERDAY];
    delete oldTasks;
    
    /*
    if(Trigger.isBefore) {
        for(Integer i=0; i<trigger.new.size(); i++) {
         	Task t = trigger.new[i];
            if(String.isNotBlank(t.CallDisposition)) {
                t.Subject += ' ' + t.CallDisposition;
            }
        }
    } 
*/
}