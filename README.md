# alzheimer-prediction


Just some quick notes:


These are the features that have been done:

1. Login with Email and Password / Login with Google
2. Register New Account
3. Connect to Firebase Authentication and Cloud Firestore
4. Upload Dataset
5. Model Result Preview

These are the pending features that will be done (or need further discussion) afterwards:

1. Integration with the ML models
2. CSV file storage (*need discussion)
3. Patient Data Entry form (*need discussion)
4. Any other possible features

Some questions that I would like to confirm with you:

1. From what you mentioned previously, are you planning to store the dataset (CSV) files in the Firebase? As far as I know, the way for storing files or images in Firebase will be the Storage Bucket, but this service is not available for free billing plan.
2. If it's not the case for (1), may I know what are the data that you want to store on the Cloud firestore?
3. Please let me know your complete flow of the app (it will be the best if you could provide a simple flowchart ) to avoid any confusion or misaligned expectations. From what you described previously, here are my undestanding:
   - You did mentioned that you wish to visualize the model performance in graphs and show the best model based on F1-score in the app dashboard, I think it will be more make sense that changing the"Dataset Upload" feature into "Model Inspect" feature or something similar, where the model will be evaluated on the dataset that you uploaded, so you could actually see how well the model performs on the dataset right?
   - Since this is the prediction system, your app could allow user to enter a single patient data and make the prediction on this patient using the best model, and it will show the predicted result (the patient has normal cognition or suffer from dementia) for that particular patient, how do you think?
4. And just a suggestion after looking through your notebook, I realize there could be some data leakage issue, which could make your evaluation result to be inaccurate, my suggestion will be splitting the dataset into training and testing set first before perform any standardization or scaling. If you need my help to improve the model training pipeline, could let me know (but extra charges might be needed :D)
