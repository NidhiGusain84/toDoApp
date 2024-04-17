public with sharing class ToDoController {
  @AuraEnabled(cacheable=true)
  public static List<Task_Manager__c> loadIncompleteRecords() {
    return [
      SELECT Id, Task_Date__c, Name
      FROM Task_Manager__c
      WHERE OwnerId = :UserInfo.getUserId() AND Is_Completed__c = FALSE
      WITH USER_MODE
      ORDER BY Task_Date__c
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<Task_Manager__c> loadCompleteRecords() {
    return [
      SELECT Id, Task_Date__c, Name
      FROM Task_Manager__c
      WHERE OwnerId = :UserInfo.getUserId() AND Is_Completed__c = TRUE
      WITH USER_MODE
      ORDER BY Completed_Date__c DESC
    ];
  }
}
